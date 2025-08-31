from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import pymysql
import pandas as pd

class_info = Blueprint('class_info', __name__)
importScores = Blueprint('importScores', __name__)

# 建议数据库连接放到单独的模块中进行管理
def connectDb():
    return pymysql.connect(
        host='student-mysql',
        user='root',
        password='123456',
        database='lzumathedu'
    )

@class_info.route('/api/class_info', methods=['POST'])
@cross_origin(origins=["http://localhost:3000", "http://127.0.0.1:3000"], supports_credentials=True)
def get_class_info():
    data = request.json
    college = data.get('college')
    grade = data.get('grade')
    major = data.get('major')

    table_name = f"{college}_{grade}_{major}"

    try:
        db = connectDb()
        with db.cursor() as cursor:
            # 查询数据库中是否存在这个表
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = %s AND table_name = %s
            """, ('lzumathedu', table_name))

            result = cursor.fetchone()
            if result:
                cursor.execute(f"SELECT * FROM `{table_name}`")
                rows = cursor.fetchall()
                columns = [desc[0] for desc in cursor.description]
                data_list = [dict(zip(columns, row)) for row in rows]

                return jsonify({
                    "table": table_name,
                    "data": data_list,  # 可选
                    'columns': [{'title': col, 'key': col} for col in columns]
                })
            else:
                return jsonify({"error": "表不存在"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()    

@importScores.route('/api/import_scores', methods=['POST'])
def import_scores():
    table_name = request.form.get('table')  # 获取前端传来的表名
    file = request.files.get('file')           # 获取上传的文件
    
    if not file or not table_name: 
        return jsonify({'error': '缺少文件或表名'}), 400

    # 判断文件类型并读取
    if file.filename.endswith('.xlsx'):
        df = pd.read_excel(file, engine='openpyxl')
    elif file.filename.endswith('.csv'):
        df = pd.read_csv(file)
    else:
        return jsonify({'error': '不支持的文件格式'}), 400

    # 检查字段
    if 'name' not in df.columns or 'score' not in df.columns:
        return jsonify({'error': '文件中必须包含 name 和 score 两列'}), 400


    try:
        conn = connectDb()
        cursor = conn.cursor()
        for _, row in df.iterrows():
            student_name = row['name']
            new_score = row['score']
            sql = f"UPDATE `{table_name}` SET score = %s WHERE name = %s"
            cursor.execute(sql, (new_score, student_name))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': '成绩导入成功'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': '数据库操作失败'}), 500      

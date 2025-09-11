from flask import Blueprint, request, jsonify
import pymysql
from flask_cors import cross_origin

showresult = Blueprint('showresult', __name__)

def connectDb():
    return pymysql.connect(
        host='student-mysql',
        user='root',
        password='123456',
        database='lzumathedu'
    )

@showresult.route('/api/dispresult', methods=['POST'])

def disp_result():

    data = request.get_json()
    table = data.get('table')
    # print("接收到表名：", table)  # 调试信息
    try:
        conn = connectDb()
        with conn.cursor() as cursor:
            cursor.execute(f"SHOW COLUMNS FROM `{table}`")
            columns = [col[0] for col in cursor.fetchall()]

            cursor.execute(f"SELECT * FROM `{table}`")
            rows_raw = cursor.fetchall()

        rows = [dict(zip(columns, row)) for row in rows_raw]

        return jsonify({
            'columns': [{'title': col, 'key': col} for col in columns],
             'rows': rows
        })
    except Exception as e:
        print("❌ 接口报错:", str(e))  # 👈 打印异常
        import traceback
        traceback.print_exc()         # 👈 打印完整堆栈
        return jsonify({'error': str(e)}), 500

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import pymysql

groupmemberEdit = Blueprint('groupmemberEdit', __name__)
groupmemberData = Blueprint('groupmemberData', __name__)
studentQuery = Blueprint('studentQuery', __name__)

def connectDb():
    return pymysql.connect(
        host='student-mysql',
        user='root',
        password='123456',
        database='lzumathedu'
    )

@groupmemberEdit.route('/api/groupmember/edit', methods=['POST'])
def groupmember_edit():
    data = request.get_json()
    action = data.get('action')
    ids = data.get('ids')

    try: 
        db = connectDb()
        cursor = db.cursor()

        if action == 'remove':

            sql = f"DELETE FROM groupmembersData WHERE id IN ({','.join(['%s']*len(ids))})"
            cursor.execute(sql, tuple(ids))
            # print(f"Deleting records with IDs: {ids}")
            db.commit()
            return jsonify({'success': True, 'message': '删除成功'})

        elif action == 'add':

            tableName = data.get('tableName')

            check_sql = f"""
                SELECT id FROM groupmembersData
                WHERE id IN ({','.join(['%s'] * len(ids))})
            """
            cursor.execute(check_sql, tuple(ids))
            existing_ids = {row[0] for row in cursor.fetchall()}
            insert_ids = [i for i in ids if i not in existing_ids]

            if insert_ids:
                query_sql = f"""
                    SELECT id, name, college, grade, major
                    FROM `{tableName}`
                    WHERE id IN ({','.join(['%s'] * len(insert_ids))})
                """
                cursor.execute(query_sql, tuple(insert_ids))
                ngms = cursor.fetchall() # new groupmembers
                print('[DEBUG] NGMS fetched:', ngms)

                if ngms:
                    insert_sql = """
                    INSERT INTO groupmembersData (id, name, college, grade, major)
                    VALUES (%s, %s, %s, %s, %s)
                    """
                    cursor.executemany(insert_sql, ngms)
                    db.commit()
                    return jsonify({'success': True, 'message': f"添加成功。{existing_ids}已是综测组员，请勿重复添加" if existing_ids else '添加成功'})

                else:
                    return jsonify({"message": "未检索到对应学生数据"}), 404

            else:
                return jsonify({'success': True, 'message': f'{existing_ids}已是综测组员，请勿重复添加'})

        else:
            return jsonify({"message": "无效操作"}), 400

    except Exception as e:
        db.rollback()
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

# 获取
@groupmemberData.route('/api/groupmember/data', methods=['GET'])
def groupmember_data():
    try: 
        db = connectDb()
        cursor = db.cursor()
        sql = "SELECT id, name, college, grade, major FROM groupmembersData"
        cursor.execute(sql)
        result = cursor.fetchall()

        datas = [
            {
                'id': row[0],
                'name': row[1],
                'college': row[2],
                'grade': row[3],
                'major': row[4],
            } for row in result
        ]

        if result:
            return jsonify({'success': True, 'message': '成功', 'datas': datas})
        else:
            return jsonify({'success': False, 'message': '失败'}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

# 检索
@studentQuery.route('/api/student/query', methods=['POST'])
def student_query():
    data = request.get_json()
    college = data.get('college')
    grade = data.get('grade')
    tableName = f"studentsData_{college}_{grade}"

    try: 
        db = connectDb()
        cursor = db.cursor()
        sql = """SELECT table_name FROM information_schema.tables WHERE table_schema = %s AND table_name = %s"""
        cursor.execute(sql, ('lzumathedu', tableName))
        result = cursor.fetchone()

        if result:
            cursor.execute(f"SELECT * FROM `{tableName}`")
            rows = cursor.fetchall()
            datas = [
            {
                'id': row[0],
                'name': row[1],
                'college': row[2],
                'grade': row[3],
                'major': row[4],
            } for row in rows
            ]

            return jsonify({ 
                'success': True, 
                'message': '成功',
                "tableName": tableName,
                "datas": datas,
            })
        else:
            return jsonify({"message": "未检索到对应数据表"}), 404

    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()            
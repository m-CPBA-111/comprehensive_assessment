from flask import Blueprint, request, jsonify
import pymysql

student = Blueprint('student', __name__)
groupmember = Blueprint('groupmember', __name__)
teacher = Blueprint('teacher', __name__)

# 数据库连接
db = pymysql.connect(
    host='student-mysql',
    user='root',
    password='123456',
    database='lzumathedu'
)

@student.route('/api/student/login', methods=['POST'])
def student_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    cursor = db.cursor()
    sql = "SELECT * FROM students WHERE username=%s AND password=%s"
    cursor.execute(sql, (username, password))
    result = cursor.fetchone()

    if result:
        return jsonify({'success': True, 'message': '登录成功'})
    else:
        return jsonify({'success': False, 'message': '账号或密码错误'}), 401

@groupmember.route('/api/groupmember/login', methods=['POST'])
def groupmember_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    cursor = db.cursor()
    sql = "SELECT * FROM groupmembers WHERE username=%s AND password=%s"
    cursor.execute(sql, (username, password))
    result = cursor.fetchone()

    if result:
        return jsonify({'success': True, 'message': '登录成功'})
    else:
        return jsonify({'success': False, 'message': '账号或密码错误'}), 401

@teacher.route('/api/teacher/login', methods=['POST'])
def teacher_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    cursor = db.cursor()
    sql = "SELECT * FROM teachers WHERE username=%s AND password=%s"
    cursor.execute(sql, (username, password))
    result = cursor.fetchone()

    if result:
        return jsonify({'success': True, 'message': '登录成功'})
    else:
        return jsonify({'success': False, 'message': '账号或密码错误'}), 401


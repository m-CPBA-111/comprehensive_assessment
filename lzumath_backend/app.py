from flask import Flask
from flask_cors import CORS

# 导入 studentApi 蓝图对象
from Api.personnel.studentApi import studentApi

app = Flask(__name__)
# 允许跨域请求（确保前端能正常访问）
CORS(app, supports_credentials=True)
app.secret_key = '@KJHKJDSH&@^&!@###ULANEDU'

# 注册蓝图（无需额外前缀，蓝图内部已定义 url_prefix）
app.register_blueprint(studentApi)

@app.route("/")
def hello():
    return "Hello World!"

if __name__ == '__main__':
    # 绑定 0.0.0.0 允许外部访问，端口保持 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
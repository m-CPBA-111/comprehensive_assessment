# Dockerfile（修改后）
FROM python:3.9
WORKDIR /app
COPY . /app
RUN pip install --upgrade pip -i https://mirrors.aliyun.com/pypi/simple/
RUN pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/
RUN pip install cryptography -i https://mirrors.aliyun.com/pypi/simple/
EXPOSE 5000
CMD ["python", "app.py"]  # 使用 JSON 数组形式
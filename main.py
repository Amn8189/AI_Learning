from flask import Flask
from flask import render_template
from flask import request, redirect
from reshape import mnist_preprocess
from flask import jsonify
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)

app.wsgi_app = ProxyFix(
    app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1
)# allow app to access ip and https

#http - https
@app.before_request
def ensure_https():
    if request.is_secure and request.headers.get("X-Forwarded-Proto", "http") == "http":
        url = request.url.replace("http://", "https://", 1)
        return redirect(url, 301)

@app.route("/")
def homepage():
    return render_template("index.html")

@app.route("/mnist_playground/", methods=["GET", "POST"])
def mnist_playground():
    mousePostitions = request.get_json()
    mnist_preprocess(mousePostitions)
    # print(mousePostitions)
    image28by28 = mnist_preprocess(input_data=mousePostitions)
    weights_1, weights_2 = load_model()
    pred = getPred(image28by28, weights_1, weights_2)
    np.set_printoptions(suppress=True, precision=2, floatmode='fixed')
    inner_list = pred[0]
    # MAKE DICTIONARY FROM 0 - 9
    predDictionary = {}
    for i in range(0, 10):
        #{ 0:90% , 1:5%,  }
        predDictionary[i] = inner_list[i]
    print(predDictionary)
    return jsonify(predDictionary)

import numpy as np
def load_model():
    file = np.load("mnistV1.npz")
    weights_1 = file["weights_1"]
    weights_2 = file["weights_2"]
    return weights_1, weights_2

def relu(x):
    return (x > 0) * x

def softmax(x):
    numerator = np.exp(x)
    denominator = np.sum(np.exp(x))
    y = numerator / denominator
    return y 

def getPred(img, weights_1, weights_2):
    layer_1 = img.reshape(1, 784)
    layer_2 = relu(np.dot(layer_1, weights_1))
    layer_3 = softmax(np.dot(layer_2, weights_2))
    return (layer_3 *100)
        


#app.run(debug=True, host="0.0.0.0", port=5000)

# 编译moxie

[官网的编译方法](https://github.com/moxiecode/moxie)

你可能会遇到下面的问题
~~~
18:06:34 0$ jake
-bash: jake: command not found
~~~
解决办法是
~~~
18:09:11 0$ node node_modules/jake/bin/cli.js mkjs .
rm -rf bin/js
Writing source version output to: bin/js/moxie.js
Writing development version to: bin/js/moxie.dev.js
Writing coverage version output to: bin/js/moxie.cov.js
Writing minified version output to: bin/js/moxie.min.js
~~~

## 最小编译
node node_modules/jake/bin/cli.js mkjs[file/FileInput] runtimes=html5 .

编译结果 38k

## demo3的编译方法 - 图片预览
node node_modules/jake/bin/cli.js mkjs[file/FileInput,image/Image] runtimes=html5 .

编译结果 73k

## demo4的编译方法 － 最小的上传库
node node_modules/jake/bin/cli.js mkjs[file/FileInput,image/Image,xhr/XMLHttpRequest] runtimes=html5 .

编译结果 77k

## 默认的编译方法
node node_modules/jake/bin/cli.js mkjs .

编译结果 107k

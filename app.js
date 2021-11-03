const http = require('http');
const https = require('https');
const axios = require('axios')

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    //call this api every 3 seconds.
    setInterval(callAPI, 3000);
});

function callAPI() {
    const options = {
        hostname: 'interview.adpeai.com',
        path: '/api/v1/get-task',
        method: 'GET'
    };

    const req = https.request(options, res => {
        console.log(`First call of the "GET" API's statusCode: ${res.statusCode}`)

        res.on('data', d => {
            var obj = JSON.parse(d);
            if (obj != undefined && obj.id != undefined && obj.operation != undefined && obj.left != undefined && obj.right != undefined) {
                var leftParsed = parseInt(obj.left);
                var rightPased = parseInt(obj.right);
                if (obj.operation != '' && !isNaN(leftParsed) && !isNaN(rightPased)) {
                    var result = 0;
                    var msg = '';
                    switch (obj.operation) {
                        case "subtraction":
                            result = leftParsed - rightPased;
                            break;
                        case "addition":
                            result = leftParsed + rightPased;
                            break;
                        case "division":
                            if (rightPased != 0) {
                                result = leftParsed / rightPased;
                            }
                            else {
                                msg = "right side is zero and it cannot be devideobj."
                            }
                            break;
                        case "multiplication":
                            result = leftParsed * rightPased;
                            break;
                        case "remainder":
                            if (rightPased != 0) {
                                result = leftParsed % rightPased;
                            }
                            break;
                        default:
                            break;
                    }
                    if (msg != '') {
                        process.stdout.write("result for id " + obj.id + " has something wrong: " + msg);
                    }
                    else {
                        //submit result
                        axios.post('https://interview.adpeai.com/api/v1/submit-task', {
                            id: obj.id,
                            result: result
                        })
                            .then(resPost => {
                                //check response code
                                if (resPost.status != undefined && resPost.status != '') {
                                    process.stdout.write("Response for id" + obj.id + " is: ");
                                    switch (resPost.status.toString()) {
                                        case "200":
                                            process.stdout.write("Success\n");
                                            break;
                                        case "400":
                                            process.stdout.write("Incorrect value in result; no ID specified; value is invalid\n");
                                            break;
                                        case "500":
                                            process.stdout.write("ID cannot be found\n");
                                            break;
                                        default:
                                            process.stdout.write("Unknown response.\n");
                                            break;
                                    }
                                }
                            })
                            .catch(error => {
                                console.error(error)
                            })
                    }
                }
            }
            else {
                process.stdout.write("cannot process with current data")
                process.stdout.write(d)
            }
        })
    })

    req.on('error', error => {
        console.error(error);
    })

    req.end();
}

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
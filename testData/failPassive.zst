{
  "about": "About text",
  "zestVersion": "1.0",
  "title": "my zest",
  "description": "a little zest script",
  "author": "mocha",
  "generatedBy": "test client",
  "type": "Passive",
  "parameters": {
    "tokenStart": "{{",
    "tokenEnd": "}}",
    "tokens": {},
    "elementType": "ZestVariables"
  },
  "statements": [
    {
      "comment": "A comment",
      "elementType": "ZestComment",
      "index": 1,
      "enabled": true
    },
    {
      "url": "http://foo.com",
      "method": "GET",
      "elementType": "ZestRequest",
      "data": "unknown",
      "headers": "unknown",
      "response": {
        "url": "http://bar.com",
        "body": "qwerty",
        "statusCode": 200,
        "responseTimeInMs": 222,
        "elementType": "ZestResponse",
        "headers": "unknown"
      },
      "assertions": [
        {
          "rootExpression": {
            "code": 200,
            "not": false,
            "elementType": "ZestExpressionStatusCode"
          },
          "elementType": "ZestAssertion"
        },
        {
          "rootExpression": {
            "length": 10,
            "approx": 1,
            "variableName": "request.url",
            "elementType": "ZestExpressionLength",
            "not": false
          },
          "elementType": "ZestAssertion"
        },
        {
          "rootExpression": {
            "regex": "/^foo/",
            "variableName": "response.body",
            "elementType": "ZestExpressionRegex",
            "caseExact": false,
            "not": false
          },
          "elementType": "ZestAssertion"
        }
      ],
      "followRedirect": false,
      "cookies": [],
      "index": 2,
      "enabled": true
    }
  ],
  "authentication": [],
  "index": 0,
  "enabled": true,
  "elementType": "ZestScript"
}

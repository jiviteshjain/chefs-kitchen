<?php
declare(strict_types=1);

use App\Application\Actions\User\ListUsersAction;
use App\Application\Actions\User\ViewUserAction;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;

use GuzzleHttp\Client;

include('config.php');

$CHEF_CLIENT = new Client([
    'base_uri' => CHEF_BASE_URL,
    'timeout' => '2.0'
]);

return function (App $app) { 

    $app->get('/', function (Request $request, Response $response) {
        $response->getBody()->write('Hello world!');
        return $response;
    });

    $app->group('/users', function (Group $group) {
        $group->get('', ListUsersAction::class);
        $group->get('/{id}', ViewUserAction::class);
    });

    $app->group('/api', function (Group $group) {
        
        $group->group('/auth', function (Group $group) {

            $group->post('/login/middle', function (Request $request, Response $response) {
                $parsedBody = $request->getParsedBody();
                error_log((string)json_encode($parsedBody));
                if (!$parsedBody || !array_key_exists('code', $parsedBody)) {
                    $error_array = ['detail' => 'Field \'code\' not found'];
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }

                $code = $parsedBody['code'];

                global $CHEF_CLIENT;
                $chef_response = $CHEF_CLIENT->post('oauth/token', [
                    'json' => [
                        'grant_type' => 'authorization_code',
                        'code' => $code,
                        'client_id' => CHEF_CLIENT_ID,
                        'client_secret' => CHEF_CLIENT_SECRET,
                        'redirect_uri' => CHEF_REDIRECT_URL
                    ]
                ]);

                if (!$chef_response->getStatusCode() == 200) {
                    $error_array = array('detail' => 'Authorization Failed');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_FORBIDDEN);
                }

                $chef_data = json_decode((string)$chef_response->getBody(), true);
                $response->getBody()->write((string)json_encode($chef_data));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_OK);
            });
        });

        $group->group('/users', function (Group $group) {
            $group->get('/me', function (Request $request, Response $response) {
                if (!$request->hasHeader('Authorization')) {
                    $error_array = array('detail' => 'Authorization header required');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }

                $auth_header = $request->getHeader('Authorization');
                global $CHEF_CLIENT;
                $chef_response = $CHEF_CLIENT->get('users/me', [
                    'headers' => [
                        'Authorization' => $auth_header,
                    ],
                ]);
                error_log((string)$chef_response->getBody());
                if (!$chef_response->getStatusCode() == 200) {
                    $error_array = array('detail' => 'API call failed');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_SERVER_ERROR);
                }

                $chef_data = json_decode((string)$chef_response->getBody(), true);
                $response->getBody()->write((string)json_encode($chef_data));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_OK);

            });
        });

        $group->group('/contests', function (Group $group) {
            $group->get('/all', function (Request $request, Response $response) {
                if (!$request->hasHeader('Authorization')) {
                    $error_array = array('detail' => 'Authorization header required');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }
                $auth_header = $request->getHeader('Authorization');
                global $CHEF_CLIENT;
                $chef_response = $CHEF_CLIENT->get('contests', [
                    'headers' => [
                        'Authorization' => $auth_header,
                    ],
                    'query' => [
                        'fields' => 'code,name',
                        'status' => 'present'
                    ]
                ]);

                error_log((string)$chef_response->getBody());
                if (!$chef_response->getStatusCode() == 200) {
                    $error_array = array('detail' => 'API call failed');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_SERVER_ERROR);
                }

                $chef_data = json_decode((string)$chef_response->getBody(), true);
                $response->getBody()->write((string)json_encode($chef_data));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_OK);

            });

            $group->get('/detail/{code}', function (Request $request, Response $response, $args) {

                if (!$request->hasHeader('Authorization')) {
                    $error_array = array('detail' => 'Authorization header required');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }

                $auth_header = $request->getHeader('Authorization');
                $code = $args['code'];
                $data = [];
                global $CHEF_CLIENT;

                // contest details request
                $query_string = 'contests/' . (string)$code;
                $chef_response = $CHEF_CLIENT->get($query_string, [
                    'headers' => [
                        'Authorization' => $auth_header,
                    ],
                    'query' => [
                        'fields' => 'code,name,startDate,endDate,type,freezingTime,problemsList',
                    ]
                ]);

                if (!$chef_response->getStatusCode() == 200) {
                    $error_array = array('detail' => 'API call failed');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }

                $data['contest'] = json_decode((string)$chef_response->getBody(), true);

                // submission details
                $chef_response = $CHEF_CLIENT->get('submissions', [
                    'headers' => [
                        'Authorization' => $auth_header,
                    ],
                    'query' => [
                        'fields' => 'id,date,username,problemCode,language,contestCode,result,time,memory',
                        'contestCode' => (string)$code,
                    ]
                ]);

                if (!$chef_response->getStatusCode() == 200) {
                    $error_array = array('detail' => 'API call failed');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }

                $data['submissions'] = json_decode((string)$chef_response->getBody(), true);

                // rank details
                $query_string = 'rankings/' . (string)$code;
                $chef_response = $CHEF_CLIENT->get($query_string, [
                    'headers' => [
                        'Authorization' => $auth_header,
                    ],
                    'query' => [
                        'fields' => 'rank,username,totalTime,penalty,country,countryCode,institution,rating,institutionType,contestId,contestCode,totalScore,problemScore',
                        'sortBy' => 'rank',
                    ]
                ]);

                if (!$chef_response->getStatusCode() == 200) {
                    $error_array = array('detail' => 'API call failed');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }

                $data['ranks'] = json_decode((string)$chef_response->getBody(), true);

                $response->getBody()->write((string)json_encode($data));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_OK);

            });

            $group->get('/{contest_code}/problems/{problem_code}', function(Request $request, Response $response, $args) {
                if (!$request->hasHeader('Authorization')) {
                    $error_array = array('detail' => 'Authorization header required');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }

                $auth_header = $request->getHeader('Authorization');
                $contest_code = $args['contest_code'];
                $problem_code = $args['problem_code'];
                $data = [];
                global $CHEF_CLIENT;

                // get problem details
                $query_string = 'contests/' . (string)$contest_code . '/problems/' . (string)$problem_code;
                $chef_response = $CHEF_CLIENT->get($query_string, [
                    'headers' => [
                        'Authorization' => $auth_header,
                    ],
                    'query' => [
                        'fields' => 'problemCode,author,problemName,languagesSupported,sourceSizeLimit,dateAdded,challengeType,maxTimeLimit,successfulSubmissions,body,totalSubmissions,partialSubmissions,tags'
                    ]
                ]);
                
                if (!$chef_response->getStatusCode() == 200) {
                    $error_array = array('detail' => 'API call failed');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }

                $data['problem'] = json_decode((string)$chef_response->getBody(), true);

                // get submission details
                $chef_response = $CHEF_CLIENT->get('submissions', [
                    'headers' => [
                        'Authorization' => $auth_header,
                    ],
                    'query' => [
                        'fields' => 'id,date,username,problemCode,language,contestCode,result,time,memory',
                        'contestCode' => (string)$contest_code,
                        'problemCode' => (string)$problem_code,
                    ]
                ]);

                if (!$chef_response->getStatusCode() == 200) {
                    $error_array = array('detail' => 'API call failed');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }

                $data['submissions'] = json_decode((string)$chef_response->getBody(), true);

                $response->getBody()->write((string)json_encode($data));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_OK);
            });
        });

        $group->group('/ide', function(Group $group) {
            $group->post('/run', function(Request $request, Response $response) {
                if (!$request->hasHeader('Authorization')) {
                    $error_array = array('detail' => 'Authorization header required');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }
                $auth_header = $request->getHeader('Authorization');

                $parsedBody = $request->getParsedBody();
                error_log((string)json_encode($parsedBody));
                
                if (!$parsedBody || !array_key_exists('code', $parsedBody)) {
                    $error_array = ['detail' => 'Field \'code\' not found'];
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }
                $code = $parsedBody['code'];

                if (!$parsedBody || !array_key_exists('lang', $parsedBody)) {
                    $error_array = ['detail' => 'Field \'lang\' not found'];
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }
                $lang = $parsedBody['lang'];

                if (!$parsedBody || !array_key_exists('input', $parsedBody)) {
                    $error_array = ['detail' => 'Field \'input\' not found'];
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }

                $input = $parsedBody['input'];

                global $CHEF_CLIENT;
                $chef_response = $CHEF_CLIENT->post('ide/run', [
                    'headers' => [
                        'Authorization' => $auth_header,
                    ],
                    'json' => [
                        'sourceCode' => $code,
                        'language' => $lang,
                        'input' => $input
                    ]
                ]);

                if (!$chef_response->getStatusCode() == 200) {
                    $error_array = array('detail' => 'API call failed');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }

                $chef_data = json_decode((string)$chef_response->getBody(), true);
                $response->getBody()->write((string)json_encode($chef_data));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_OK);


            });

            $group->post('/status', function (Request $request, Response $response) {
                if (!$request->hasHeader('Authorization')) {
                    $error_array = array('detail' => 'Authorization header required');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }
                $auth_header = $request->getHeader('Authorization');

                $parsedBody = $request->getParsedBody();
                error_log((string)json_encode($parsedBody));
                
                if (!$parsedBody || !array_key_exists('link', $parsedBody)) {
                    $error_array = ['detail' => 'Field \'link\' not found'];
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }
                $link = $parsedBody['link'];


                global $CHEF_CLIENT;

                $chef_response = $CHEF_CLIENT->get('ide/status', [
                    'headers' => [
                        'Authorization' => $auth_header,
                    ],
                    'query' => [
                        'link' => (string)$link
                    ]
                ]);
                
                if (!$chef_response->getStatusCode() == 200) {
                    $error_array = array('detail' => 'API call failed');
                    $response->getBody()->write((string)json_encode($error_array));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_BAD_REQUEST);
                }

                $chef_data = json_decode((string)$chef_response->getBody(), true);
                $response->getBody()->write((string)json_encode($chef_data));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(HTTP_OK);

            });
        });
    });
};

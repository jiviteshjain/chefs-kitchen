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
    });
};

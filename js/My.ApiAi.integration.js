const client = new ApiAi.ApiAiClient({accessToken: '1892c70ded2846f295a0705a1a9aaaed'});
const response_text = client.textRequest(longTextRequest);
const response_payload = client.

response_text
    .then(handleResponse)
    .catch(handleError);

function handleResponse(serverResponse) {
        console.log(serverResponse);
}
function handleError(serverError) {
        console.log(serverError);
}
#!/bin/sh

echo "-> waiting for Keycloak to boot"
count=0
until curl -s http://keycloak:8080/auth/ > /dev/null
do
    count=$((count+1))
    if [[ count == 300 ]]; then
        echo 'Keycloak boot timeout.'
        exit 1
    fi
    
    sleep 1
done
echo "<- Keycloak is up & running"

echo "-> running tests"
cd /usr/app
yarn test
exit_code=$?
echo "<- tests execution completed"

echo "-> building ./coverage/coverage.lcov report file..."
./node_modules/.bin/nyc report --reporter=text-lcov > ./coverage/coverage.lcov
echo "-> ./coverage/coverage.lcov created"

exit $exit_code
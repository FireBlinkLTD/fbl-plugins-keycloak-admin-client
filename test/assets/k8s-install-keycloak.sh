#!/bin/bash

KC_PORT=30800

echo "-> removing previously installed Keycloak (if any)..."
helm del --purge keycloak
echo "<- Keycloak removed"

echo "-> installing Keycloak..."
helm install --name keycloak stable/keycloak --wait \
  --set image.tag=4.8.0.Final \
  --set image.repository=jboss/keycloak \
  --set keycloak.username=admin \
  --set keycloak.password=admin \
  --set keycloak.service.type=NodePort \
  --set keycloak.service.nodePort=$KC_PORT
echo "<- Keycloak installed. Node port $KC_PORT"

KC_HOST=$(kubectl get nodes --namespace default -o jsonpath="{.items[0].status.addresses[0].address}")



echo "KC_HOST=$KC_HOST" > /tmp/kc.env
echo "KC_PORT=$KC_PORT" >> /tmp/kc.env
# Credentials Configuration

Based on your preference / security requirements you may want to use either user based login or [service account](https://www.keycloak.org/docs/latest/server_admin/index.html#_service_accounts)

## Admin User Example Configuration

```yaml
credentials:
  # [optional] realmName to authenticate on
  realmName: master
  baseUrl: https://keycloak.host/auth
  grantType: password
  clientId: admin-cli
  username: admin
  password: admin
  # Note: it is better to reference sensitive data from secrets, e.g.:
  #username: $ref:secrets.keycloak.admin.username
  #password: $ref:secrets.keycloak.admin.password

  # [optional] additional request configuration
  requestConfig:
    # [optional] request timeout in milliseconds
    # Default value: 30000 (30 seconds)
    timeout: 15000
```

## Service Account Example Configuration

```yaml
credentials:
  # [optional] realmName to authenticate on
  realmName: master
  baseUrl: https://keycloak.host/auth
  grantType: client_credentials
  clientId: admin-cli
  clientSecret: f8b4288a-1e0f-4ba0-ad43-c3b123054b3f
  # Note: it is better to reference sensitive data from secrets, e.g.:
  # clientSecret: $ref:secrets.keycloak.clientSecret
```

# User Management

CRUD operations over `User`.

## Get User

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.get

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.get`
- `keycloak.user.get`

### Example

```yaml
keycloak.user.get:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [optional] User name
  # Note: either username or email field is required
  username: admin

  # [optional] User email
  # Note: either username or email field is required
  email: admin@fireblink.com

  # [optional] Assign user to context
  # Follows common assign logic practices https://fbl.fireblink.com/plugins/common#assign-to
  assignUserTo: $.ctx.user

  # [optional] Push user to context
  # Follows common push logic practices https://fbl.fireblink.com/plugins/common#push-to
  pushUserTo: $.ctx.users
```

## Create User

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.create

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.create`
- `keycloak.user.create`

### Example

```yaml
keycloak.user.create:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] User representation
  user:
    # [required] User name
    username: admin

    # [required] User email
    email: admin@fireblink.com
    # [optional] other user fields - https://www.keycloak.org/docs-api/6.0/rest-api/index.html#_userrepresentation
    # Note: `groups`, `realmRoles` and `clientRoles` have no affect upon creation and will be ignored
```

## Update User

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.update

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.update`
- `keycloak.user.update`

### Example

```yaml
keycloak.user.update:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: realm-name

  # [optional] User name
  # Note: either username or email field is required
  username: admin

  # [optional] User email
  # Note: either username or email field is required
  email: admin@fireblink.com

  # [required] User representation
  user:
    # [required] User name
    username: admin

    # [required] User email
    email: admin@fireblink.com
    # [optional] other user fields - https://www.keycloak.org/docs-api/6.0/rest-api/index.html#_userrepresentation
    # Note: `groups`, `realmRoles` and `clientRoles` have no affect upon update and will be ignored
```

## Delete User

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.delete

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.delete`
- `keycloak.user.delete`

### Example

```yaml
keycloak.user.delete:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: realm-name

  # [optional] User name
  # Note: either username or email field is required
  username: admin

  # [optional] User email
  # Note: either username or email field is required
  email: admin@fireblink.com
```

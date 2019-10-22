# Client Role Management

CRUD operations over `Realm roles`.

## Get Realm Role

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.realm.role.get

**Aliases:**

- `fbl.plugins.keycloak.admin.client.realm.role.get`
- `keycloak.realm.role.get`

### Example

```yaml
keycloak.realm.role.get:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Client role name
  roleName: role

  # [optional] Assign role to context
  # Follows common assign logic practices https://fbl.fireblink.com/plugins/common#assign-to
  assignRoleTo: $.ctx.client

  # [optional] Push role to context
  # Follows common push logic practices https://fbl.fireblink.com/plugins/common#push-to
  pushRoleTo: $.ctx.clients
```

## Create Realm Role

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.realm.role.create

**Aliases:**

- `fbl.plugins.keycloak.admin.client.realm.role.create`
- `keycloak.realm.role.create`

### Example

```yaml
keycloak.realm.role.create:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Client representation
  role:
    # [required] Role name
    name: role-name

    # [optional] define composite role configuration
    composites:
      # [optional] realm roles
      realm:
        - realm-role-1
        - realm-role-2

      # [optional] clientId/roles mapping
      client:
        someClientId:
          - client-role-1
          - client-role-2
    # [optional] other client fields - https://www.keycloak.org/docs-api/6.0/rest-api/index.html#_rolerepresentation
```

## Update Realm Role

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.realm.role.update

**Aliases:**

- `fbl.plugins.keycloak.admin.client.realm.role.update`
- `keycloak.realm.role.update`

### Example

```yaml
keycloak.realm.role.update:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: realm-name

  # [required] Client role name
  roleName: role

  # [required] Client representation
  role:
    # [required] Role name
    name: role-name

    # [optional] define composite role configuration
    # Note: roles not specified in the configuration below will removed from mapping
    composites:
      # [optional] realm roles
      realm:
        - realm-role-1
        - realm-role-2

      # [optional] clientId/roles mapping
      client:
        someClientId:
          - client-role-1
          - client-role-2
    # [optional] other client fields - https://www.keycloak.org/docs-api/6.0/rest-api/index.html#_rolerepresentation
```

## Delete Realm Role

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.realm.role.delete

**Aliases:**

- `fbl.plugins.keycloak.admin.client.realm.role.delete`
- `keycloak.realm.role.delete`

### Example

```yaml
keycloak.realm.role.delete:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: realm-name

  # [required] Client role name
  roleName: role
```

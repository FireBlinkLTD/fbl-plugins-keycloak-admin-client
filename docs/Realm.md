# Realm Management

CRUD operations over `Realm`.

# Get Realm

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.realm.get

**Aliases:**

- `fbl.plugins.keycloak.admin.client.realm.get`
- `keycloak.realm.get`

## Example

```yaml
keycloak.realm.get:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [optional] Assign realm to context
  # Follows common assign logic practices https://fbl.fireblink.com/plugins/common#assign-to
  assignRealmTo: $.ctx.realm

  # [optional] Push realm to context
  # Follows common push logic practices https://fbl.fireblink.com/plugins/common#push-to
  pushRealmTo: $.ctx.relams
```

## Create Realm

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.realm.create

**Aliases:**

- `fbl.plugins.keycloak.admin.client.realm.create`
- `keycloak.realm.create`

## Example

```yaml
keycloak.realm.create:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm representation
  realm:
    # [required] Realm name
    realm: realm-name
    # [optional] other realm fields - https://www.keycloak.org/docs-api/6.0/rest-api/index.html#_realmrepresentation
```

## Update Realm

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.realm.update

**Aliases:**

- `fbl.plugins.keycloak.admin.client.realm.update`
- `keycloak.realm.update`

## Example

```yaml
keycloak.realm.update:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name to update
  realmName: realm-name

  # [required] Realm representation
  realm:
    # [required] Realm name
    realm: realm-name
    # [optional] other realm fields - https://www.keycloak.org/docs-api/6.0/rest-api/index.html#_realmrepresentation
```

## Delete Realm

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.realm.delete

**Aliases:**

- `fbl.plugins.keycloak.admin.client.realm.delete`
- `keycloak.realm.delete`

## Example

```yaml
keycloak.realm.delete:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name to delete
  realmName: realm-name
```

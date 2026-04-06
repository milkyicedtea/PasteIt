use deadpool_postgres::{Config, ManagerConfig, Pool as PgPool, RecyclingMethod, Runtime, SslMode, tokio_postgres::NoTls};
use std::env;

pub(crate) async fn get_db_pool(key: &str) -> PgPool {
    let database_url = env::var(key).expect(&format!("Key {key} must be set"));
    let mut cfg = Config::new();
    cfg.url = Some(database_url);
    cfg.manager = Some(ManagerConfig {
        recycling_method: RecyclingMethod::Fast,
    });
    cfg.ssl_mode = Some(SslMode::Prefer);

    cfg.create_pool(Some(Runtime::Tokio1), NoTls).unwrap()
}
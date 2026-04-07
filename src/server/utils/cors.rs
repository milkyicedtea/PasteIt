use axum::http::{HeaderValue, Method};
use tower_http::cors::{Any, CorsLayer};

pub fn create_cors_layer() -> CorsLayer {
    if cfg!(debug_assertions) {
        CorsLayer::new()
            .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
            .allow_credentials(true)
            .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
    } else {
        CorsLayer::new()
            .allow_origin(Any) // like "*"
            .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
    }
}

use crate::routes::pastes::pastes_router;
use crate::utils::appstate::AppState;
use crate::utils::cors::create_cors_layer;
use crate::utils::database_config::get_db_pool;
use crate::utils::swagger::ApiDoc;
use axum::http::HeaderValue;
use axum::routing::get;
use axum::Router;
use reqwest::header::CACHE_CONTROL;
use std::net::SocketAddr;
use tower::ServiceBuilder;
use tower_http::services::{ServeDir, ServeFile};
use tower_http::set_header::SetResponseHeaderLayer;
use utoipa::OpenApi;
use utoipa_swagger_ui::{Config, SwaggerUi};

mod routes;
mod utils;

const BUILD_DIR: &str = "./dist";

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let pool = get_db_pool("DB_URL").await;

    let state = AppState { pool };

    // vite assets
    let assets_service = ServeDir::new(format!("{BUILD_DIR}/assets"));
    let cached_assets = ServiceBuilder::new()
        .layer(SetResponseHeaderLayer::if_not_present(
            CACHE_CONTROL,
            HeaderValue::from_static("public, max-age=31536000, immutable"),
        ))
        .service(assets_service);

    // full dist directory
    let dist_serivce = ServeDir::new(format!("{BUILD_DIR}"));

    // serve favicon
    let favicon_file = ServeFile::new(format!("{BUILD_DIR}/clipboard.svg"));

    // spa index.html fallback
    let index_file = ServeFile::new(format!("{BUILD_DIR}/index.html"));

    let app = Router::new()
        // API routes
        .nest(
            "/api",
            Router::new()
                .nest("/pastes", pastes_router())
                .route("/test", get(|| async { "Hello World!" })),
        )
        // expose favicon
        .route_service("/clipboard.svg", favicon_file)
        // Static routes
        .nest_service("/assets", cached_assets)
        .fallback_service(dist_serivce.not_found_service(index_file))
        // SwaggerUI
        .merge(
            SwaggerUi::new("/api/docs")
                .url("/api/docs/openapi.json", ApiDoc::openapi())
                .config(
                    Config::default()
                        .use_base_layout()
                        .try_it_out_enabled(false)
                        .doc_expansion("list")
                        .with_syntax_highlight(true),
                ),
        )
        .layer(create_cors_layer())
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 4000));
    println!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .unwrap();
}

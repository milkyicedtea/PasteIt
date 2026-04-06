use utoipa::OpenApi;
use crate::routes::pastes::{__path_create_paste, __path_get_paste};

#[derive(OpenApi)]
#[openapi(
    paths(
        create_paste, get_paste
    ),
    tags(
        (name = "pastes", description = "Paste management")
    ),
    info(
        title = "PasteIt API",
        version = env!("CARGO_PKG_VERSION"),
    )
)]
pub(crate) struct ApiDoc;
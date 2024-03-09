type PossibleMode = 'production' | 'development';

type WidgetId = string;

type WidgetSettingsBackdrop = {
    backdrop: boolean;
    backdrop_color: string;
    backdrop_close_click: boolean;
}

type WidgetModel = {
    id: WidgetId;
    url: string;
    project_id: number;
    is_enabled: boolean;
    trigger_type: 'unseen' | 'none';
};

type EmbedWidget = WidgetModel & {
    widget_type: 'embed';
    widget_settings: {
        selector: string;
        show_labels: boolean;
        show_header: boolean;
    },
}

type ModalWidget = WidgetModel & {
    widget_type: 'modal';
    widget_settings: WidgetSettingsBackdrop & {
        border_radius: string;
        height: string;
        width: string;
    }
}

type AnyWidget = WidgetModel & (EmbedWidget | ModalWidget);

export {
    type WidgetId,
    type WidgetModel,
    type EmbedWidget,
    type ModalWidget,
    type AnyWidget,
    type PossibleMode,
};
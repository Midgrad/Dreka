//     Copyright (c) Mikhail Rogachev 2022.
//     mishkarogachev@gmail.com
//
//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
//
//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
//
//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <https://www.gnu.org/licenses/>.

#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QVersionNumber>
#include <QtWebEngine>

// Data source
#include "communication_description_repository_sql.h"
#include "home_items_repository_sql.h"
#include "missions_repository_sql.h"
#include "route_items_repository_sql.h"
#include "routes_repository_sql.h"
#include "sqlite_schema.h"
#include "vehicles_repository_sql.h"

// Domain
#include "command_service.h"
#include "gui_layout.h"
#include "locator.h"
#include "missions_service.h"
#include "property_tree.h"
#include "routes_service.h"
#include "vehicles_features.h"
#include "vehicles_service.h"

// App
#include "communication_service.h"
#include "module_loader.h"
#include "theme.h"
#include "theme_activator.h"
#include "theme_loader.h"

// Presentation
#include "clipboard_controller.h"
#include "map_grid_controller.h"
#include "map_layers_controller.h"
#include "map_menu_controller.h"
#include "map_ruler_controller.h"
#include "map_viewport_controller.h"
#include "mission_operation_controller.h"
#include "mission_route_controller.h"
#include "route_item_controller.h"
#include "route_pattern_controller.h"
#include "routes_controller.h"
#include "vehicles_controller.h"

namespace
{
constexpr char gitRevision[] = "git_revision";
constexpr char databaseName[] = "dreka.db";
} // namespace

using namespace md;

int main(int argc, char* argv[])
{
    QCoreApplication::setOrganizationName("Midgrad");
    QCoreApplication::setApplicationVersion(
        QVersionNumber(VERSION_MAJOR, VERSION_MINOR, VERSION_PATCH).toString());

    QGuiApplication::setAttribute(Qt::AA_EnableHighDpiScaling, true);
    QGuiApplication::setAttribute(Qt::AA_UseHighDpiPixmaps, true);
    QGuiApplication::setAttribute(Qt::AA_ShareOpenGLContexts);

    QGuiApplication app(argc, argv);
    app.setProperty(::gitRevision, QString(GIT_REVISION));

    // Data source initialization
    data_source::SqliteSchema schema(::databaseName);
    schema.setup();

    // Domain services initialization
    data_source::VehiclesRepositorySql vehiclesRepository(schema.db());
    domain::VehiclesService vehiclesService(&vehiclesRepository);
    app::Locator::provide<domain::IVehiclesService>(&vehiclesService);

    domain::VehiclesFeatures features;
    app::Locator::provide<domain::IVehiclesFeatures>(&features);

    data_source::RoutesRepositorySql routesRepository(schema.db());
    data_source::RouteItemsRepositorySql routeItemsRepository(schema.db());
    domain::RoutesService routesService(&routesRepository, &routeItemsRepository);
    app::Locator::provide<domain::IRoutesService>(&routesService);

    data_source::MissionsRepositorySql missionsRepository(schema.db());
    data_source::HomeItemsRepositorySql homeItemsRepository(schema.db());
    domain::MissionsService missionsService(&routesService, &missionsRepository,
                                            &homeItemsRepository);
    app::Locator::provide<domain::IMissionsService>(&missionsService);

    domain::PropertyTree pTree;
    app::Locator::provide<domain::IPropertyTree>(&pTree);

    domain::CommandsService commandsService;
    app::Locator::provide<domain::ICommandsService>(&commandsService);

    presentation::GuiLayout layout;
    app::Locator::provide<presentation::IGuiLayout>(&layout);

    // app layer initializaion
    data_source::CommunicationDescriptionRepositorySql communicationDescriptionRepository(
        schema.db());
    app::CommunicationService communicationService(&communicationDescriptionRepository);
    app::Locator::provide<app::CommunicationService>(&communicationService);

    // Presentation initialization
    QtWebEngine::initialize();

    // TODO: unify registrations
    qmlRegisterType<presentation::MapViewportController>("Dreka", 1, 0, "MapViewportController");
    qmlRegisterType<presentation::MapRulerController>("Dreka", 1, 0, "MapRulerController");
    qmlRegisterType<presentation::MapGridController>("Dreka", 1, 0, "MapGridController");
    qmlRegisterType<presentation::MapMenuController>("Dreka", 1, 0, "MapMenuController");
    qmlRegisterType<presentation::ClipboardController>("Dreka", 1, 0, "ClipboardController");
    qmlRegisterType<presentation::MapLayersController>("Dreka", 1, 0, "MapLayersController");
    qmlRegisterType<presentation::RoutesController>("Dreka", 1, 0, "RoutesController");
    qmlRegisterType<presentation::RouteItemController>("Dreka", 1, 0, "RouteItemController");
    qmlRegisterType<presentation::RoutePatternController>("Dreka", 1, 0, "RoutePatternController");
    qmlRegisterType<presentation::VehiclesController>("Dreka", 1, 0, "VehiclesController");
    qmlRegisterType<presentation::MissionOperationController>("Dreka", 1, 0,
                                                              "MissionOperationController");
    qmlRegisterType<presentation::MissionRouteController>("Dreka", 1, 0, "MissionRouteController");

    QQmlApplicationEngine engine;
    industrialThemeActivate(true, &engine);

    // Industrial Controls
    ThemeLoader themeLoader;
    themeLoader.setTheme(IndustrialTheme::instance());
    themeLoader.setFilename("./theme.json");
    themeLoader.load();

    // Industrial Indicators
    Q_INIT_RESOURCE(industrial_indicators_qml);

    // App modules initialization
    app::ModuleLoader moduleLoader;
    moduleLoader.discoverModules();
    moduleLoader.loadModules();

    // TODO: soft caching, read only on demand
    vehiclesService.readAll();
    routesService.readAll();
    missionsService.readAll();

    engine.rootContext()->setContextProperty("layout", layout.items());
    engine.rootContext()->setContextProperty("applicationDirPath",
                                             QGuiApplication::applicationDirPath());

    engine.load(QUrl(QStringLiteral("qrc:/MainWindow.qml")));

    QObject::connect(&app, &QGuiApplication::aboutToQuit, &moduleLoader,
                     &app::ModuleLoader::unloadAllModules);

    return app.exec();
}

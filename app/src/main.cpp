//     Copyright (c) Mikhail Rogachev 2021.
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

#include "sqlite_schema.h"
#include "vehicles_repository_sql.h"

#include "command_service.h"
#include "gui_layout.h"
#include "locator.h"
#include "missions_repository_sql.h"
#include "property_tree.h"
#include "routes_repository_sql.h"
#include "vehicles_service.h"

#include "module_loader.h"
#include "theme.h"
#include "theme_activator.h"
#include "theme_loader.h"

#include "clipboard_controller.h"
#include "map_grid_controller.h"
#include "map_layers_controller.h"
#include "map_menu_controller.h"
#include "map_ruler_controller.h"
#include "map_viewport_controller.h"
#include "mission_controller.h"
#include "routes_controller.h"
#include "vehicles_controller.h"
#include "waypoint_controller.h"

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

    QGuiApplication::setAttribute(Qt::AA_DisableHighDpiScaling, true);
    QGuiApplication::setAttribute(Qt::AA_ShareOpenGLContexts);

    QGuiApplication app(argc, argv);
    app.setProperty(::gitRevision, QString(GIT_REVISION));

    // Data source initialization
    data_source::SqliteSchema schema(::databaseName);
    schema.setup();

    // Domain services initialization
    domain::RoutesRepositorySql routesRepository(schema.db());
    app::Locator::provide<domain::IRoutesRepository>(&routesRepository);

    domain::MissionsRepositorySql missionsRepository(&routesRepository, schema.db());
    app::Locator::provide<domain::IMissionsRepository>(&missionsRepository);

    data_source::VehiclesRepositorySql vehiclesRepository(schema.db());
    domain::VehiclesService vehiclesService(&vehiclesRepository);
    app::Locator::provide<domain::IVehiclesService>(&vehiclesService);

    domain::PropertyTree pTree;
    app::Locator::provide<domain::IPropertyTree>(&pTree);

    domain::CommandsService commandsService;
    app::Locator::provide<domain::ICommandsService>(&commandsService);

    presentation::GuiLayout layout;
    app::Locator::provide<presentation::IGuiLayout>(&layout);

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
    qmlRegisterType<presentation::WaypointController>("Dreka", 1, 0, "WaypointController");
    qmlRegisterType<presentation::VehiclesController>("Dreka", 1, 0, "VehiclesController");
    qmlRegisterType<presentation::MissionController>("Dreka", 1, 0, "MissionController");

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
    missionsRepository.readAll();

    engine.rootContext()->setContextProperty("layout", layout.items());
    engine.rootContext()->setContextProperty("applicationDirPath",
                                             QGuiApplication::applicationDirPath());

    engine.load(QUrl(QStringLiteral("qrc:/MainWindow.qml")));

    return app.exec();
}

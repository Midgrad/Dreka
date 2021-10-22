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

#include "repository_factory_sql.h"
#include "sqlite_schema.h"

#include "command_service.h"
#include "gui_layout.h"
#include "locator.h"
#include "missions_service.h"
#include "property_tree.h"
#include "routes_service.h"
#include "vehicles_service.h"

#include "module_loader.h"
#include "theme.h"
#include "theme_activator.h"
#include "theme_loader.h"

#include "clipboard_controller.h"
#include "map_grid_controller.h"
#include "map_layers_controller.h"
#include "map_ruler_controller.h"
#include "map_viewport_controller.h"
#include "routes_controller.h"

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
    domain::RepositoryFactorySql repoFactory(schema.db());

    domain::RoutesService routesService(&repoFactory);
    app::Locator::provide<domain::IRoutesService>(&routesService);

    domain::MissionsService missionsService(&routesService, &repoFactory);
    app::Locator::provide<domain::IMissionsService>(&missionsService);

    domain::VehiclesService vehiclesService(&repoFactory);
    app::Locator::provide<domain::IVehiclesService>(&vehiclesService);

    domain::PropertyTree pTree;
    app::Locator::provide<domain::IPropertyTree>(&pTree);

    domain::CommandsService commandsService;
    app::Locator::provide<domain::ICommandsService>(&commandsService);

    presentation::GuiLayout layout;
    app::Locator::provide<presentation::IGuiLayout>(&layout);

    // Presentation initialization
    QtWebEngine::initialize();

    qmlRegisterType<presentation::MapViewportController>("Dreka", 1, 0, "MapViewportController");
    qmlRegisterType<presentation::MapRulerController>("Dreka", 1, 0, "MapRulerController");
    qmlRegisterType<presentation::MapGridController>("Dreka", 1, 0, "MapGridController");
    qmlRegisterType<presentation::ClipboardController>("Dreka", 1, 0, "ClipboardController");
    qmlRegisterType<presentation::MapLayersController>("Dreka", 1, 0, "MapLayersController");
    qmlRegisterType<presentation::RoutesController>("Dreka", 1, 0, "RoutesController");

    QQmlApplicationEngine engine;
    industrialThemeActivate(true, &engine);

    ThemeLoader themeLoader;
    themeLoader.setTheme(IndustrialTheme::instance());
    themeLoader.setFilename("./theme.json");
    themeLoader.load();

    // App modules initialization
    app::ModuleLoader moduleLoader;
    moduleLoader.discoverModules();
    moduleLoader.loadModules();

    // TODO: soft caching, read only on demand
    vehiclesService.readAll();
    missionsService.readAll();

    engine.rootContext()->setContextProperty("qmlEntries", layout.items());
    engine.rootContext()->setContextProperty("applicationDirPath",
                                             QGuiApplication::applicationDirPath());

    engine.load(QUrl(QStringLiteral("qrc:/MainWindow.qml")));

    return app.exec();
}

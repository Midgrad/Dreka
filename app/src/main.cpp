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

#include "locator.h"
#include "property_tree.h"

#include "module_loader.h"
#include "theme.h"
#include "theme_activator.h"
#include "theme_loader.h"

#include "clipboard_controller.h"
#include "map_grid_controller.h"
#include "map_layers_controller.h"
#include "map_ruler_controller.h"
#include "map_viewport_controller.h"

namespace
{
const char* gitRevision = "git_revision";
} // namespace

int main(int argc, char* argv[])
{
    QCoreApplication::setOrganizationName("Midgrad");
    QCoreApplication::setApplicationVersion(
        QVersionNumber(VERSION_MAJOR, VERSION_MINOR, VERSION_PATCH).toString());

    QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
    QCoreApplication::setAttribute(Qt::AA_ShareOpenGLContexts);

    QGuiApplication app(argc, argv);
    app.setProperty(::gitRevision, QString(GIT_REVISION));

    kjarni::domain::PropertyTree pTree;
    kjarni::domain::Locator::provide<kjarni::domain::IPropertyTree>(&pTree);

    // FIXME: demonstrtation telemetry values
    QJsonArray modes = QJsonArray({ "auto", "manual", "rtl", "circle" });
    pTree.setProperty("MAV 23", QJsonObject({ { "callsign", "MAVIK 23" },
                                              { "state", "ACTIVE" },
                                              { "armed", true },
                                              { "mode", "auto" },
                                              { "modes", modes },
                                              { "gs", 34.234 },
                                              { "ias", 36.875 },
                                              { "tas", 36.963 },
                                              { "pitch", 12.2 },
                                              { "roll", 23.6 },
                                              { "latitude", 55.972512 },
                                              { "longitude", 37.153741 },
                                              { "satelliteAltitude", 5657 },
                                              { "relativeHeight", 5544 },
                                              { "absoluteHeight", 5660 },
                                              { "climb", -1.1 },
                                              { "elevation", 5324 },
                                              { "heading", 132.7 },
                                              { "course", 141.2 },
                                              { "wp", 3 },
                                              { "wps", 28 },
                                              { "wpDistance", 1453 },
                                              { "homeDistance", 2315 } }));
    pTree.setProperty("UAV 13", QJsonObject({ { "callsign", "UAV-13" },
                                              { "state", "EMERGENCY" },
                                              { "armed", false },
                                              { "mode", "rtl" },
                                              { "modes", modes },
                                              { "gs", 27.123 },
                                              { "ias", 25.234 },
                                              { "tas", 25.876 },
                                              { "pitch", -7.5 },
                                              { "roll", -4.4 },
                                              { "latitude", 55.950577 },
                                              { "longitude", 37.152934 },
                                              { "satelliteAltitude", 8374 },
                                              { "relativeHeight", 8238 },
                                              { "absoluteHeight", 8380 },
                                              { "climb", 1.5 },
                                              { "elevation", 8341 },
                                              { "heading", -64.3 },
                                              { "course", -60.1 },
                                              { "wp", 6 },
                                              { "wps", 31 },
                                              { "wpDistance", 512 },
                                              { "homeDistance", 1223 } }));

    QtWebEngine::initialize();

    qmlRegisterType<dreka::endpoint::MapViewportController>("Dreka", 1, 0, "MapViewportController");
    qmlRegisterType<dreka::endpoint::MapRulerController>("Dreka", 1, 0, "MapRulerController");
    qmlRegisterType<dreka::endpoint::MapGridController>("Dreka", 1, 0, "MapGridController");
    qmlRegisterType<dreka::endpoint::ClipboardController>("Dreka", 1, 0, "ClipboardController");
    qmlRegisterType<dreka::endpoint::MapLayersController>("Dreka", 1, 0, "MapLayersController");

    QQmlApplicationEngine engine;
    industrialThemeActivate(true, &engine);

    ThemeLoader themeLoader;
    themeLoader.setTheme(IndustrialTheme::instance());
    themeLoader.setFilename("./theme.json");
    themeLoader.load();

    kjarni::app::ModuleLoader moduleLoader;
    moduleLoader.discoverModules();
    moduleLoader.loadModules();

    QJsonObject qmlEntries;
    for (const QString& moduleId : moduleLoader.loadedModules())
    {
        moduleLoader.module(moduleId)->visit(qmlEntries);
    }

    engine.rootContext()->setContextProperty("qmlEntries", qmlEntries);
    engine.rootContext()->setContextProperty("applicationDirPath",
                                             QGuiApplication::applicationDirPath());

    engine.load(QUrl(QStringLiteral("qrc:/MainWindow.qml")));

    return app.exec();
}

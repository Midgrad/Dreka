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

    QGuiApplication::setAttribute(Qt::AA_DisableHighDpiScaling, true);
    QGuiApplication::setAttribute(Qt::AA_ShareOpenGLContexts);

    QGuiApplication app(argc, argv);
    app.setProperty(::gitRevision, QString(GIT_REVISION));

    md::domain::PropertyTree pTree;
    md::app::Locator::provide<md::domain::IPropertyTree>(&pTree);

    QtWebEngine::initialize();

    qmlRegisterType<md::presentation::MapViewportController>("Dreka", 1, 0, "MapViewportController");
    qmlRegisterType<md::presentation::MapRulerController>("Dreka", 1, 0, "MapRulerController");
    qmlRegisterType<md::presentation::MapGridController>("Dreka", 1, 0, "MapGridController");
    qmlRegisterType<md::presentation::ClipboardController>("Dreka", 1, 0, "ClipboardController");
    qmlRegisterType<md::presentation::MapLayersController>("Dreka", 1, 0, "MapLayersController");

    QQmlApplicationEngine engine;
    industrialThemeActivate(true, &engine);

    ThemeLoader themeLoader;
    themeLoader.setTheme(IndustrialTheme::instance());
    themeLoader.setFilename("./theme.json");
    themeLoader.load();

    md::app::ModuleLoader moduleLoader;
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

#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QVersionNumber>
#include <QtWebEngine>

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

// TODO: to utils
void mergeJson(QJsonObject& src, const QJsonObject& other)
{
    for (auto it = other.constBegin(); it != other.constEnd(); ++it)
    {
        if (src.contains(it.key()))
        {
            if (src.value(it.key()).isObject() && other.value(it.key()).isObject())
            {
                QJsonObject one(src.value(it.key()).toObject());
                QJsonObject two(other.value(it.key()).toObject());

                mergeJson(one, two);
                src[it.key()] = one;
            }
            else if (src.value(it.key()).isArray() && other.value(it.key()).isArray())
            {
                QJsonArray arr = other.value(it.key()).toArray();
                QJsonArray srcArr = src.value(it.key()).toArray();
                for (int i = 0; i < arr.size(); i++)
                    srcArr.append(arr[i]);
                src[it.key()] = srcArr;
            }
        }
        else
            src[it.key()] = it.value();
    }
}
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
    QtWebEngine::initialize();

    qmlRegisterType<MapViewportController>("Dreka", 1, 0, "MapViewportController");
    qmlRegisterType<MapRulerController>("Dreka", 1, 0, "MapRulerController");
    qmlRegisterType<MapGridController>("Dreka", 1, 0, "MapGridController");
    qmlRegisterType<ClipboardController>("Dreka", 1, 0, "ClipboardController");
    qmlRegisterType<MapLayersController>("Dreka", 1, 0, "MapLayersController");

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
        ::mergeJson(qmlEntries, moduleLoader.module(moduleId)->qmlEntries());
    }

    engine.rootContext()->setContextProperty("qmlEntries", qmlEntries);
    engine.rootContext()->setContextProperty("applicationDirPath",
                                             QGuiApplication::applicationDirPath());

    engine.load(QUrl(QStringLiteral("qrc:/MainWindow.qml")));

    return app.exec();
}

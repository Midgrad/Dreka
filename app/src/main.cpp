#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QVersionNumber>
#include <QtWebEngine>

#include "map_viewport_controller.h"
#include "theme.h"
#include "theme_activator.h"
#include "theme_loader.h"

namespace {
const char* gitRevision = "git_revision";
}

int main(int argc, char* argv[]) {
  QCoreApplication::setOrganizationName("Midgrad");
  QCoreApplication::setApplicationVersion(
      QVersionNumber(VERSION_MAJOR, VERSION_MINOR, VERSION_PATCH).toString());

  QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
  QCoreApplication::setAttribute(Qt::AA_ShareOpenGLContexts);

  QGuiApplication app(argc, argv);
  app.setProperty(::gitRevision, QString(GIT_REVISION));
  QtWebEngine::initialize();

  MapViewportController viewportController;

  QQmlApplicationEngine engine;
  engine.rootContext()->setContextProperty("viewportController",
                                           &viewportController);
  industrialThemeActivate(true, &engine);

  ThemeLoader themeLoader;
  themeLoader.setTheme(IndustrialTheme::instance());
  themeLoader.setFilename("../app/theme.json");
  themeLoader.load();

  engine.load(QUrl(QStringLiteral("../app/qml/MainWindow.qml")));

  return app.exec();
}

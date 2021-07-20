#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QtWebEngine>

#include "map_viewport_controller.h"
#include "theme.h"
#include "theme_activator.h"
#include "theme_loader.h"

int main(int argc, char* argv[]) {
  QCoreApplication::setOrganizationName("Midgrad");

  QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
  QCoreApplication::setAttribute(Qt::AA_ShareOpenGLContexts);

  QGuiApplication app(argc, argv);
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

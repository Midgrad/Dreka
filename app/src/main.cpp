#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QtWebEngine>

int main(int argc, char* argv[]) {
  QCoreApplication::setOrganizationName("Midgrad");
  QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
  QCoreApplication::setAttribute(Qt::AA_ShareOpenGLContexts);

  QGuiApplication app(argc, argv);
  QtWebEngine::initialize();

  QQmlApplicationEngine engine;
  engine.load(QUrl(QStringLiteral("../app/qml/MainWindow.qml")));

  return app.exec();
}

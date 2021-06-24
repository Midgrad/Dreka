#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>

int main(int argc, char* argv[]) {
  QGuiApplication::setAttribute(Qt::AA_DisableHighDpiScaling, true);

  QGuiApplication app(argc, argv);
  QQmlApplicationEngine engine;

  engine.load(QStringLiteral("../app/qml/MainWindow.qml"));

  return app.exec();
}

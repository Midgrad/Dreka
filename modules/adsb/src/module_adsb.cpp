#include "module_adsb.h"

#include <QDebug>
#include <QQmlEngine>

#include "adsb_controller.h"

using namespace dreka::app;

ModuleAdsb::ModuleAdsb()
{
    qmlRegisterType<endpoint::AdsbController>("Dreka.Adsb", 1, 0, "AdsbController");
}

void ModuleAdsb::init()
{
}

void ModuleAdsb::done()
{
}

QString ModuleAdsb::qmlUrl() const
{
    return "qrc:/Adsb/AdsbView.qml";
}

#include "adsb_controller.h"

#include "opensky_adsb_source.h"

using namespace dreka::endpoint;

AdsbController::AdsbController(QObject* parent) :
    QObject(parent),
    m_source(new domain::OpenskyAdsbSource(this))
{
}

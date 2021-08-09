#include "adsb_controller.h"

#include "opensky_adsb_source.h"

using namespace dreka::endpoint;

AdsbController::AdsbController(QObject* parent) :
    QObject(parent),
    m_source(new domain::OpenskyAdsbSource(this))
{
    connect(m_source, &domain::IAdsbSource::adsbDataReceived, this, &AdsbController::adsbChanged);
    m_source->start();
}

QJsonArray AdsbController::adsb() const
{
    return m_source->adsbData();
}

#ifndef ADSB_CONTROLLER_H
#define ADSB_CONTROLLER_H

#include "i_adsb_source.h"

namespace dreka::endpoint
{
class AdsbController : public QObject
{
    Q_OBJECT

public:
    explicit AdsbController(QObject* parent = nullptr);

private:
    domain::IAdsbSource* const m_source;
};
} // namespace dreka::endpoint

#endif // ADSB_CONTROLLER_H

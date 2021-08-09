#ifndef ADSB_OPENSKY_H
#define ADSB_OPENSKY_H

#include "i_module.h"
#include "opensky_client.h"

namespace dreka::app
{
class AdsbOpensky
    : public QObject
    , public IModule
{
    Q_OBJECT
    Q_INTERFACES(dreka::app::IModule)
    Q_PLUGIN_METADATA(IID "Midgrad.Dreka.AdsbOpensky" FILE "meta.json")

public:
    Q_INVOKABLE AdsbOpensky();

    void init() override;
    void done() override;

    QStringList qmlUrls() const override;

private:
    domain::OpenskyClient* m_client = nullptr;
};
} // namespace dreka::app

#endif // ADSB_OPENSKY_H

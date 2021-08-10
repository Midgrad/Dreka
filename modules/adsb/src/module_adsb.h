#ifndef ADSB_OPENSKY_H
#define ADSB_OPENSKY_H

#include "i_module.h"

namespace dreka::app
{
class ModuleAdsb
    : public QObject
    , public kjarni::app::IModule
{
    Q_OBJECT
    Q_INTERFACES(kjarni::app::IModule)
    Q_PLUGIN_METADATA(IID "Midgrad.ModuleAdsb" FILE "meta.json")

public:
    Q_INVOKABLE ModuleAdsb();

    void init() override;
    void done() override;

    QJsonObject qmlEntries() const override;
};
} // namespace dreka::app

#endif // ADSB_OPENSKY_H

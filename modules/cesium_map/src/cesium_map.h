#ifndef CESIUM_MAP_H
#define CESIUM_MAP_H

#include "i_module.h"

namespace dreka::service
{
class CesiumMap
    : public QObject
    , public IModule
{
    Q_OBJECT
    Q_INTERFACES(dreka::service::IModule)
    Q_PLUGIN_METADATA(IID "Midgrad.Dreka.CesiumMap" FILE "meta.json")

public:
    Q_INVOKABLE CesiumMap();

    void init() override;
    void done() override;
};
} // namespace dreka::service

#endif // CESIUM_MAP_H

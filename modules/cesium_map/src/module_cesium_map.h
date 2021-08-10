#ifndef MODULE_CESIUM_MAP_H
#define MODULE_CESIUM_MAP_H

#include "i_module.h"

namespace dreka::app
{
class ModuleCesiumMap
    : public QObject
    , public kjarni::app::IModule
{
    Q_OBJECT
    Q_INTERFACES(kjarni::app::IModule)
    Q_PLUGIN_METADATA(IID "Midgrad.ModuleCesiumMap" FILE "meta.json")

public:
    Q_INVOKABLE ModuleCesiumMap();

    void init() override;
    void done() override;

    QJsonObject qmlEntries() const override;
};
} // namespace dreka::app

#endif // MODULE_CESIUM_MAP_H

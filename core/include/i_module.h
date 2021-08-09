#ifndef I_MODULE_H
#define I_MODULE_H

#include <QJsonObject>
#include <QObject>

namespace dreka::app
{
class IModule
{
public:
    IModule() = default;
    virtual ~IModule() = default;

    virtual void init() = 0;
    virtual void done() = 0;

    virtual QJsonObject qmlEntries() const = 0;
};
} // namespace dreka::app

Q_DECLARE_INTERFACE(dreka::app::IModule, "Midgrad.Dreka.IModule")

#endif // I_MODULE_H

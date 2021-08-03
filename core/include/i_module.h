#ifndef I_MODULE_H
#define I_MODULE_H

#include <QObject>

namespace dreka::service
{
class IModule
{
public:
    IModule() = default;
    virtual ~IModule() = default;

    virtual void init() = 0;
    virtual void done() = 0;

    virtual QStringList qmlUrls() const = 0;
};
} // namespace dreka::service

Q_DECLARE_INTERFACE(dreka::service::IModule, "Midgrad.Dreka.IModule")

#endif // I_MODULE_H

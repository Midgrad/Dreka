#ifndef I_MODULE_H
#define I_MODULE_H

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

    virtual QStringList qmlUrls() const = 0;
};
} // namespace dreka::app

Q_DECLARE_INTERFACE(dreka::app::IModule, "Midgrad.Dreka.IModule")

#endif // I_MODULE_H

#ifndef I_MODULE_H
#define I_MODULE_H

#include <QObject>

namespace dreka_service
{
class IModule
{
public:
    virtual ~IModule() = default;

    virtual void init() = 0;
    virtual void done() = 0;
};
} // namespace dreka_service

Q_DECLARE_INTERFACE(dreka_service::IModule, "Midgrad.Dreka.IModule")

#endif // I_MODULE_H

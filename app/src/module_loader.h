#ifndef MODULE_LOADER_H
#define MODULE_LOADER_H

#include "i_module.h"

namespace dreka::service
{
class ModuleLoader : public QObject
{
    Q_OBJECT

public:
    explicit ModuleLoader(QObject* parent = nullptr);

    void discover();
};
} // namespace dreka::service

#endif // MODULE_LOADER_H

#ifndef MODULE_LOADER_H
#define MODULE_LOADER_H

#include "i_module.h"

#include <QMap>
#include <QPluginLoader>

namespace dreka::service
{
class ModuleLoader : public QObject
{
    Q_OBJECT

public:
    explicit ModuleLoader(QObject* parent = nullptr);

    QStringList discoveredModules() const;
    QStringList loadedModules() const;
    QJsonObject moduleMetaData(const QString& moduleId) const;

    void loadModule(const QString& moduleId);
    void loadModules(const QStringList& moduleIds);
    void loadModules();
    void unloadModule(const QString& moduleId);
    void discoverModules();

signals:
    void moduleDiscovered(QString moduleId);
    void moduleLoaded(QString moduleId);
    void moduleUnloaded(QString moduleId);

private:
    QMap<QString, QPluginLoader*> m_discoveredLoaders;
    QMap<QString, IModule*> m_loadedModules;
};
} // namespace dreka::service

#endif // MODULE_LOADER_H

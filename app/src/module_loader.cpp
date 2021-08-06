#include "module_loader.h"

#include <QDebug>
#include <QDir>

namespace
{
constexpr char modulesPath[] = "./modules";
}

using namespace dreka::app;

ModuleLoader::ModuleLoader(QObject* parent)
{
}

QStringList ModuleLoader::discoveredModules() const
{
    return m_discoveredLoaders.keys();
}

QStringList ModuleLoader::loadedModules() const
{
    return m_loadedModules.keys();
}

QJsonObject ModuleLoader::moduleMetaData(const QString& moduleId) const
{
    if (!m_discoveredLoaders.contains(moduleId))
        return QJsonObject();

    return m_discoveredLoaders[moduleId]->metaData();
}

IModule* ModuleLoader::module(const QString& moduleId) const
{
    return m_loadedModules.value(moduleId, nullptr);
}

void ModuleLoader::loadModule(const QString& moduleId)
{
    QPluginLoader* loader = m_discoveredLoaders.value(moduleId, nullptr);
    if (!loader)
        return;

    if (!loader->load())
    {
        qWarning() << loader->errorString();
        return;
    }

    IModule* module = qobject_cast<IModule*>(loader->instance());

    qDebug() << "Module:" << loader->instance();
    if (!module)
        return;

    module->init();
    m_loadedModules.insert(moduleId, module);
    emit moduleLoaded(moduleId);
}

void ModuleLoader::loadModules(const QStringList& moduleIds)
{
    for (const QString& moduleId : moduleIds)
    {
        this->loadModule(moduleId);
    }
}

void ModuleLoader::loadModules()
{
    this->loadModules(m_discoveredLoaders.keys());
}

void ModuleLoader::unloadModule(const QString& moduleId)
{
    QPluginLoader* loader = m_discoveredLoaders.value(moduleId, nullptr);
    if (!loader)
        return;

    IModule* module = m_loadedModules.value(moduleId, nullptr);
    if (!module)
        return;

    module->done();

    if (m_discoveredLoaders[moduleId]->unload())
    {
        m_loadedModules.remove(moduleId);
        emit moduleUnloaded(moduleId);
    }
    else
    {
        qWarning() << "Error unloading plugin:" << loader->errorString();
    }
}

void ModuleLoader::discoverModules()
{
    QDir dir(::modulesPath);

    for (const QString& moduleId : dir.entryList(QDir::Files))
    {
        if (m_discoveredLoaders.contains(moduleId))
            continue;

        QPluginLoader* loader = new QPluginLoader(dir.absoluteFilePath(moduleId), this);

        m_discoveredLoaders[moduleId] = loader;
        emit moduleDiscovered(moduleId);
    }
}

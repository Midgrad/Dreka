#include "map_layers_controller.h"

#include <QDebug>
#include <QJsonArray>
#include <QJsonObject>

#include "json_source_file.h"

namespace
{
constexpr char name[] = "name";
constexpr char type[] = "type";
constexpr char url[] = "url";
constexpr char visibility[] = "visibility";
constexpr char opacity[] = "opacity";

constexpr char layersFileName[] = "./layers.json";
} // namespace

using namespace md::presentation;

MapLayersController::MapLayersController(QObject* parent) :
    QObject(parent),
    m_source(new data_source::JsonSourceFile(::layersFileName))
{
}

QJsonArray MapLayersController::layers() const
{
    return m_layers;
}

void MapLayersController::save()
{
    if (m_layers.isEmpty())
        return;

    m_source->save(QJsonDocument(m_layers));
}

void MapLayersController::restore()
{
    QJsonDocument document = m_source->read();
    if (!document.isArray())
        return;

    m_layers = document.array();
    emit layersChanged();
}

void MapLayersController::toggleVisibility(const QString& name)
{
    QJsonArray newLayers;

    for (const QJsonValue& value : qAsConst(m_layers))
    {
        auto object = value.toObject();

        if (object.value(::name) == name)
        {
            object[::visibility] = true;
        }
        else
        {
            object[::visibility] = false;
        }
        newLayers.append(object);
    }

    m_layers = newLayers;
    emit layersChanged();
}

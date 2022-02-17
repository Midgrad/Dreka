#include "missions_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

MissionsController::MissionsController(QObject* parent) :
    QObject(parent),
    m_missionsService(md::app::Locator::get<IMissionsService>()),
    m_routesService(md::app::Locator::get<IRoutesService>())
{
    Q_ASSERT(m_missionsService);
    Q_ASSERT(m_routesService);

    connect(m_missionsService, &IMissionsService::missionAdded, this, [this](Mission* mission) {
        connect(mission, &Mission::changed, this, &MissionsController::missionsChanged);
        emit missionsChanged();
    });
    connect(m_missionsService, &IMissionsService::missionRemoved, this, [this](Mission* mission) {
        disconnect(mission, nullptr, this, nullptr);
        emit missionsChanged();
    });

    connect(m_routesService, &IRoutesService::routeAdded, this, [this](Route* route) {
        connect(route, &Route::changed, this, &MissionsController::routesChanged);
        emit routesChanged();
    });
    connect(m_routesService, &IRoutesService::routeRemoved, this, [this](Route* route) {
        disconnect(route, nullptr, this, nullptr);
        emit routesChanged();
    });
}

QJsonArray MissionsController::missions() const
{
    QJsonArray jsons;
    for (Mission* mission : m_missionsService->missions())
    {
        jsons.append(QJsonObject::fromVariantMap(mission->toVariantMap()));
    }

    return jsons;
}

QJsonArray MissionsController::routes() const
{
    QJsonArray jsons;

    jsons.append(QJsonObject::fromVariantMap(
        { { props::id, QVariant() }, { props::name, tr("No route") } }));
    for (Route* route : m_routesService->routes())
    {
        jsons.append(QJsonObject::fromVariantMap(route->toVariantMap()));
    }

    return jsons;
}

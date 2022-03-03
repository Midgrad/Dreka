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

    for (Mission* mission : m_missionsService->missions())
    {
        connect(mission, &Mission::changed, this, &MissionsController::routesChanged);
    }

    connect(m_routesService, &IRoutesService::routeAdded, this, [this](Route* route) {
        connect(route, &Route::changed, this, &MissionsController::routesChanged);
        emit routesChanged();
    });
    connect(m_routesService, &IRoutesService::routeRemoved, this, [this](Route* route) {
        disconnect(route, nullptr, this, nullptr);
        emit routesChanged();
    });

    for (Route* route : m_routesService->routes())
    {
        connect(route, &Route::changed, this, &MissionsController::routesChanged);
    }
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

QJsonObject MissionsController::selectedMission() const
{
    if (!m_selectedMission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_selectedMission->toVariantMap());
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

void MissionsController::selectMission(const QVariant& missionId)
{
    Mission* mission = m_missionsService->mission(missionId);
    if (m_selectedMission == mission)
        return;

    m_selectedMission = mission;
    emit selectedMissionChanged();
}

void MissionsController::rename(const QString& name)
{
    if (!m_selectedMission)
        return;

    m_selectedMission->name.set(name);
    m_missionsService->saveMission(m_selectedMission);
}

void MissionsController::remove()
{
    if (!m_selectedMission)
        return;

    m_missionsService->removeMission(m_selectedMission);
}

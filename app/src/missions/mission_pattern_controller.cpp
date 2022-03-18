#include "mission_pattern_controller.h"

#include <QDebug>

#include "locator.h"
#include "mission_traits.h"

using namespace md::domain;
using namespace md::presentation;

MissionPatternController::MissionPatternController(QObject* parent) :
    QObject(parent),
    m_missionsService(md::app::Locator::get<IMissionsService>())
{
    Q_ASSERT(m_missionsService);
}

QVariant MissionPatternController::missionId() const
{
    return m_mission ? m_mission->id() : QVariant();
}

QVariant MissionPatternController::pattern() const
{
    return m_pattern ? m_pattern->toVariantMap() : QVariant();
}

QJsonArray MissionPatternController::parameters() const
{
    if (!m_pattern)
        return QJsonArray();

    QJsonArray jsons;
    for (const ParameterType* parameter : m_pattern->type()->parameters.values())
    {
        jsons.append(QJsonObject::fromVariantMap(parameter->toVariantMap()));
    }
    return jsons;
}

QJsonObject MissionPatternController::parameterValues() const
{
    if (!m_pattern)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_pattern->parameters());
}

QJsonArray MissionPatternController::pathPositions() const
{
    if (!m_pattern)
        return QJsonArray();

    return QJsonArray::fromVariantList(m_pattern->path().toVariantList());
}

QJsonArray MissionPatternController::areaPositions() const
{
    if (!m_pattern)
        return QJsonArray();

    return QJsonArray::fromVariantList(m_pattern->area().toVariantList());
}

bool MissionPatternController::isReady() const
{
    if (!m_pattern)
        return false;

    return m_pattern->isReady();
}

void MissionPatternController::selectMission(const QVariant& missionId)
{
    if (this->missionId() == missionId)
        return;

    m_mission = m_missionsService->mission(missionId);
    emit missionChanged();

    if (m_pattern)
        this->cancel();
}

void MissionPatternController::createPattern(const QString& patternTypeId)
{
    if (!m_mission)
        return;

    if (m_pattern)
        m_pattern->deleteLater();

    m_pattern = m_missionsService->createRoutePattern(patternTypeId);

    if (m_pattern)
    {
        connect(m_pattern, &RoutePattern::pathPositionsChanged, this,
                &MissionPatternController::pathPositionsChanged);
        connect(m_pattern, &RoutePattern::changed, this,
                &MissionPatternController::parameterValuesChanged);

        if (m_mission->route()->count())
        {
            // Take initial altitude from entry point
            Geodetic entryPoint = m_mission->route()->lastItem()->position;
            if (m_pattern->hasParameter(mission::altitude.id))
                m_pattern->setParameter(mission::altitude.id, entryPoint.altitude());
        }
    }
    emit patternChanged();
    emit parameterValuesChanged();
    emit pathPositionsChanged();
}

void MissionPatternController::setParameter(const QString& parameterId, const QVariant& value)
{
    if (!m_pattern)
        return;

    m_pattern->setParameter(parameterId, value);
}

void MissionPatternController::setAreaPositions(const QVariantList& positions)
{
    if (!m_pattern)
        return;

    QVector<Geodetic> areaPositions;
    for (const QVariant& position : positions)
    {
        areaPositions.append(Geodetic(position.toMap()));
    }
    m_pattern->setArea(areaPositions);
}

void MissionPatternController::cancel()
{
    if (m_pattern)
    {
        m_pattern->deleteLater();
        m_pattern = nullptr;
    }

    emit patternChanged();
    emit parameterValuesChanged();
    emit pathPositionsChanged();
}

void MissionPatternController::apply()
{
    if (!m_pattern || !m_mission)
        return;

    for (MissionRouteItem* item : m_pattern->createItems())
    {
        m_mission->route()->addItem(item);
    }
    m_missionsService->saveMission(m_mission);

    this->cancel();
}

#include "comm_link_list_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

CommLinkListController::CommLinkListController(QObject* parent) :
    QObject(parent),
    m_commLinks(md::app::Locator::get<ICommLinksService>())
{
    Q_ASSERT(m_commLinks);

    connect(m_commLinks, &ICommLinksService::commLinkTypesChanged, this,
            &CommLinkListController::commLinkTypesChanged);
    connect(m_commLinks, &ICommLinksService::commLinkAdded, this,
            &CommLinkListController::onCommLinkAdded);
    connect(m_commLinks, &ICommLinksService::commLinkRemoved, this,
            &CommLinkListController::onCommLinkRemoved);

    for (CommLink* commLink : m_commLinks->commLinks())
    {
        this->onCommLinkAdded(commLink);
    }
}

QVariantList CommLinkListController::commLinkTypes() const
{
    QVariantList list;
    for (const CommLinkType* type : m_commLinks->commLinkTypes())
    {
        list.append(type->toVariantMap());
    }
    return list;
}

QJsonArray CommLinkListController::commLinks() const
{
    QJsonArray commLinks;
    for (CommLink* commLink : m_commLinks->commLinks())
    {
        commLinks += QJsonObject::fromVariantMap(commLink->toVariantMap());
    }
    return commLinks;
}

QJsonObject CommLinkListController::commLink(const QVariant& commLinkId) const
{
    CommLink* commLink = m_commLinks->commLink(commLinkId);
    if (commLink)
        return QJsonObject::fromVariantMap(commLink->toVariantMap());

    return QJsonObject();
}

void CommLinkListController::addCommLink(const QString& typeId)
{
    const CommLinkType* type = m_commLinks->commLinkType(typeId);
    if (!type)
        return;

    QStringList linkNames;
    for (CommLink* vehicle : m_commLinks->commLinks())
    {
        linkNames += vehicle->name;
    }

    auto link = new CommLink(type, utils::nameFromType(type->name, linkNames));
    m_commLinks->saveCommLink(link);
}

void CommLinkListController::remove(const QVariant& commLinkId)
{
    CommLink* commLink = m_commLinks->commLink(commLinkId);
    if (!commLink)
        return;

    m_commLinks->removeCommLink(commLink);
}

void CommLinkListController::connectDiscconectLink(const QVariant& commLinkId, bool connect)
{
    CommLink* commLink = m_commLinks->commLink(commLinkId);
    if (!commLink)
        return;

    commLink->connectDisconnectLink(connect);
}

void CommLinkListController::rename(const QVariant& commLinkId, const QString& name)
{
    CommLink* commLink = m_commLinks->commLink(commLinkId);
    if (!commLink)
        return;

    commLink->name.set(name);
    m_commLinks->saveCommLink(commLink);
}

void CommLinkListController::onCommLinkAdded(CommLink* commLink)
{
    connect(commLink, &CommLink::changed, this, [this, commLink]() {
        emit commLinkChanged(commLink->id, commLink->toVariantMap());
    });
    emit commLinksChanged();
}

void CommLinkListController::onCommLinkRemoved(CommLink* commLink)
{
    disconnect(commLink, nullptr, this, nullptr);
    emit commLinksChanged();
}

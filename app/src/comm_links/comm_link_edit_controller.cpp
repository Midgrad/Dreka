#include "comm_link_edit_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

CommLinkEditController::CommLinkEditController(QObject* parent) :
    QObject(parent),
    m_commLinks(md::app::Locator::get<ICommLinksService>())
{
    Q_ASSERT(m_commLinks);

    connect(m_commLinks, &ICommLinksService::commLinkChanged, this, [this](domain::CommLink* link) {
        if (m_link == link)
        {
            emit linkChanged();
        }
    });

    connect(m_commLinks, &ICommLinksService::commLinkRemoved, this, [this](domain::CommLink* link) {
        if (m_link == link)
        {
            m_link = nullptr;
            emit linkChanged();
        }
    });
}

QVariant CommLinkEditController::linkId() const
{
    return m_link ? m_link->id() : QVariant();
}

QVariantMap CommLinkEditController::link() const
{
    return m_link ? m_link->toVariantMap() : QVariantMap();
}

QVariantList CommLinkEditController::typeParameters() const
{
    if (!m_link)
        return QVariantList();

    QVariantList list;
    for (auto parameter : m_link->type()->parameters())
    {
        list.append(parameter->toVariantMap());
    }
    return list;
}

QVariantMap CommLinkEditController::itemParameters() const
{
    if (!m_link)
        return QVariantMap();

    return m_link->parametersMap();
}

QVariantList CommLinkEditController::protocols() const
{
    QVariantList list;

    // TODO: protocols

    return list;
}

void CommLinkEditController::selectLink(const QVariant& linkId)
{
    domain::CommLink* link = m_commLinks->commLink(linkId);

    if (m_link)
        disconnect(m_link, nullptr, this, nullptr);

    if (m_link == link)
        return;

    if (m_link)
        connect(m_link, &domain::CommLink::changed, this, &CommLinkEditController::linkChanged);

    m_link = link;
    emit linkChanged();
}

void CommLinkEditController::remove()
{
    if (!m_link)
        return;

    m_commLinks->removeCommLink(m_link);
}

void CommLinkEditController::connectDisconectLink(bool connect)
{
    if (!m_link)
        return;

    emit m_link->connectDisconnectLink(connect);
}

void CommLinkEditController::rename(const QString& newName)
{
    if (!m_link)
        return;

    m_link->name.set(newName);
    m_commLinks->saveCommLink(m_link);
}

void CommLinkEditController::setParameter(const QString& parameterId, const QVariant& value)
{
    if (!m_link)
        return;

    m_link->parameter(parameterId)->setValue(value);
    m_commLinks->saveCommLink(m_link);
}
